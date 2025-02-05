using Carter;

namespace ProyectoCarter.Modules
{
    public class AuthModule : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
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

            app.MapGet("/error", async (HttpContext ctx) =>
            {
                ctx.Response.ContentType = "text/html";
                await ctx.Response.SendFileAsync("wwwroot/views/error.html");
            });
        }


    }
}
