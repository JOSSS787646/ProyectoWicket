using Carter;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using ProyectoCarter.Repositories;

namespace ProyectoCarter.Modules
{
    public class AuthModule : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/auth");

            group.MapPost("/login", async ([FromBody] LoginRequest login, UsuarioRepository repo) =>
            {
                var usuario = await repo.GetByUsername(login.Username);
                if (usuario is null) return Results.Unauthorized();

                if (!BCrypt.Net.BCrypt.Verify(login.Password, usuario.Contraseña))
                    return Results.Unauthorized();

                // Obtener el nombre del rol
                var rol = await repo.GetRolById(usuario.RolId);

                return Results.Ok(new
                {
                    Id = usuario.Id,
                    Nombre = usuario.Nombre,
                    Correo = usuario.Correo,
                    RolId = usuario.RolId,
                    RolNombre = rol?.Nombre ?? "Sin Rol" // Asegurar que siempre tenga valor
                });
            });

            group.MapGet("/menu/{rolId}", async (int rolId, UsuarioRepository repo) =>
            {
                // 1. Obtener TODOS los módulos a los que el rol tiene acceso (aunque no puedan consultar)
                var query = @"
        SELECT m.Id, m.NombreModulo, m.Ruta, m.Icono, m.Orden, m.ModuloPadreId,
               rm.PuedeConsultar, rm.PuedeAgregar, rm.PuedeEditar, rm.PuedeEliminar
        FROM Modulo m
        LEFT JOIN RolModulo rm ON m.Id = rm.ModuloId AND rm.RolId = @RolId
        ORDER BY m.Orden";

                var todosModulos = await repo.GetConnection().QueryAsync<ModuloConPermisos>(query, new { RolId = rolId });

                // 2. Filtrar solo módulos con permiso de consulta
                var modulosConPermiso = todosModulos.Where(m => m.PuedeConsultar).ToList();

                // 3. Construir jerarquía completa
                var modulosRaiz = modulosConPermiso
                    .Where(m => m.ModuloPadreId == null)
                    .OrderBy(m => m.Orden)
                    .ToList();

                // Función recursiva para construir la jerarquía
                void ConstruirJerarquia(List<ModuloConPermisos> modulosPadre)
                {
                    foreach (var modulo in modulosPadre)
                    {
                        modulo.Hijos = modulosConPermiso
                            .Where(m => m.ModuloPadreId == modulo.Id)
                            .OrderBy(m => m.Orden)
                            .ToList();

                        if (modulo.Hijos.Any())
                        {
                            ConstruirJerarquia(modulo.Hijos);
                        }
                    }
                }

                ConstruirJerarquia(modulosRaiz);

                return Results.Ok(modulosRaiz);
            });

            group.MapPost("/register", async ([FromBody] RegisterRequest request, UsuarioRepository repo) =>
            {
                var existeUsuario = await repo.GetByUsername(request.Username);
                if (existeUsuario is not null)
                {
                    return Results.BadRequest("El usuario ya está registrado.");
                }

                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

                var nuevoUsuario = new Usuario
                {
                    Nombre = request.Username,
                    Correo = request.Email,
                    Contraseña = hashedPassword,
                    RolId = 2
                };

                var resultado = await repo.Create(nuevoUsuario);
                return resultado > 0 ? Results.Ok("Registro exitoso") : Results.BadRequest("Error al registrar usuario.");
            });

            group.MapGet("/usuarios", async (UsuarioRepository repo) =>
            {
                var usuarios = await repo.GetAll();
                return Results.Ok(usuarios);
            });

            group.MapDelete("/usuarios/{id}", async (int id, UsuarioRepository repo) =>
            {
                var usuario = await repo.GetById(id); // Suponiendo que tienes un método GetById para obtener el usuario por su id
                if (usuario is null)
                {
                    return Results.NotFound("Usuario no encontrado.");
                }

                var resultado = await repo.Delete(id); // Suponiendo que tienes un método Delete para eliminar un usuario
                return resultado > 0 ? Results.Ok("Usuario eliminado correctamente.") : Results.BadRequest("Error al eliminar el usuario.");
            });

            group.MapGet("/roles", async (UsuarioRepository repo) =>
            {
                var roles = await repo.GetRoles(); // Método que devuelve los roles
                return Results.Ok(roles);
            });

            group.MapPost("/roles", async ([FromBody] Rol nuevoRol, UsuarioRepository repo) =>
            {
                // Lógica para agregar el nuevo rol
                var resultado = await repo.CreateRole(nuevoRol);
                return resultado > 0 ? Results.Ok("Rol creado exitosamente.") : Results.BadRequest("Error al crear el rol.");
            });

            group.MapPut("/usuarios/{id}", async (int id, [FromBody] Usuario usuario, UsuarioRepository repo) =>
            {
                var usuarioExistente = await repo.GetById(id);
                if (usuarioExistente is null)
                {
                    return Results.NotFound("Usuario no encontrado.");
                }

                usuario.Id = id; // Asegurar que el ID del usuario coincida con el de la URL
                var resultado = await repo.Update(usuario);
                return resultado > 0 ? Results.Ok("Usuario actualizado correctamente.") : Results.BadRequest("Error al actualizar el usuario.");
            });

            group.MapGet("/modulos", async (UsuarioRepository repo) =>
            {
                var modulos = await repo.GetModulos();
                return Results.Ok(modulos);
            });

            group.MapGet("/permisos/{rolId}", async (int rolId, UsuarioRepository repo) =>
            {
                var permisos = await repo.GetPermisosPorRol(rolId);
                return Results.Ok(permisos);
            });

            group.MapPost("/permisos/{rolId}", async (int rolId, [FromBody] List<PermisoRequest> permisos, UsuarioRepository repo) =>
            {
                try
                {
                    if (permisos == null || !permisos.Any())
                    {
                        return Results.BadRequest(new { success = false, message = "No se recibieron permisos para guardar" });
                    }

                    var resultado = await repo.GuardarPermisos(rolId, permisos);

                    if (resultado)
                    {
                        return Results.Ok(new { success = true, message = "Permisos actualizados correctamente" });
                    }
                    else
                    {
                        return Results.BadRequest(new { success = false, message = "Error al guardar los permisos" });
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error en endpoint /permisos: {ex.Message}");
                    return Results.StatusCode(500);
                }
            });

            group.MapGet("/modulos/jerarquia", async (UsuarioRepository repo) =>
            {
                var modulos = await repo.GetModulos();

                var modulosRaiz = modulos
                    .Where(m => m.ModuloPadreId == null)
                    .OrderBy(m => m.Orden)
                    .ToList();

                var modulosHijos = modulos
                    .Where(m => m.ModuloPadreId != null)
                    .ToList();

                foreach (var modulo in modulosRaiz)
                {
                    modulo.Hijos = modulosHijos
                        .Where(m => m.ModuloPadreId == modulo.Id)
                        .OrderBy(m => m.Orden)
                        .ToList();
                }

                return Results.Ok(modulosRaiz);
            });


            // Redirigir a la página de login al acceder a la raíz
            app.MapGet("/", (HttpContext ctx) =>
            {
                ctx.Response.Redirect("/login");
                return Task.CompletedTask;
            });

            // Rutas para vistas
            app.MapGet("/login", async (HttpContext ctx) =>
            {
                ctx.Response.ContentType = "text/html";
                await ctx.Response.SendFileAsync("wwwroot/views/login.html");
            });

            app.MapGet("/dashboard", async (HttpContext ctx) =>
            {
                ctx.Response.ContentType = "text/html";
                await ctx.Response.SendFileAsync("wwwroot/views/dashboard.html");
            });

            app.MapGet("/registro", async (HttpContext ctx) =>
            {
                ctx.Response.ContentType = "text/html";
                await ctx.Response.SendFileAsync("wwwroot/views/registro.html");
            });

            app.MapGet("/admin", async (HttpContext ctx) =>
            {
                ctx.Response.ContentType = "text/html";
                await ctx.Response.SendFileAsync("wwwroot/views/administrar.html");
            });
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class PermisoRequest
    {
        public int ModuloId { get; set; }
        public bool PuedeConsultar { get; set; }
        public bool PuedeAgregar { get; set; }
        public bool PuedeEditar { get; set; }
        public bool PuedeEliminar { get; set; }
        public bool PuedeExportar { get; set; }
        public bool PuedeVerBitacora { get; set; }
    }
}