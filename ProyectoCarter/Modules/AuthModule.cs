using Carter;
using Microsoft.AspNetCore.Mvc;
using ProyectoCarter.Repositories;

namespace ProyectoCarter.Modules
{
    public class AuthModule : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/auth");

            group.MapPost("/login", async (HttpContext http, [FromBody] LoginRequest login, UsuarioRepository repo) =>
            {
                var usuario = await repo.GetByUsername(login.Username);
                if (usuario is null || !BCrypt.Net.BCrypt.Verify(login.Password, usuario.Contraseña))
                {
                    return Results.Unauthorized();
                }

                return Results.Ok(new { usuario.Id, usuario.Nombre, usuario.Correo, usuario.RolId });
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
}
