using Carter;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProyectoCarter.Repositories;

namespace ProyectoCarter.Modules
{
    public class UsuariosModule : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/usuarios");

            group.MapGet("/", async (UsuarioRepository repo) => Results.Ok(await repo.GetAll()));

            group.MapGet("/{id:int}", async (int id, UsuarioRepository repo) =>
            {
                var usuario = await repo.GetById(id);
                return usuario is not null ? Results.Ok(usuario) : Results.NotFound();
            });

            group.MapPost("/", async ([FromBody] Usuario usuario, UsuarioRepository repo) =>
            {
                var result = await repo.Create(usuario);
                return result > 0 ? Results.Created($"/usuarios/{usuario.Id}", usuario) : Results.BadRequest();
            });

            group.MapPut("/{id:int}", async (int id, [FromBody] Usuario usuario, UsuarioRepository repo) =>
            {
                usuario.Id = id;
                var result = await repo.Update(usuario);
                return result > 0 ? Results.Ok(usuario) : Results.NotFound();
            });

            group.MapDelete("/{id:int}", async (int id, UsuarioRepository repo) =>
            {
                var result = await repo.Delete(id);
                return result > 0 ? Results.Ok() : Results.NotFound();
            });
        }
    }
}
