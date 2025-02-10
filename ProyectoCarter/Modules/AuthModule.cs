using Carter;

namespace ProyectoCarter.Modules
{
    public class AuthModule : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            // Redirigir a la página de login al acceder a la raíz
            app.MapGet("/", (HttpContext ctx) =>
            {
                ctx.Response.Redirect("/login");
                return Task.CompletedTask;
            });

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

            app.MapGet("/construccion", async (HttpContext ctx) =>
            {
                ctx.Response.ContentType = "text/html";
                await ctx.Response.SendFileAsync("wwwroot/views/construccion.html");
            });
        }
    }
}
