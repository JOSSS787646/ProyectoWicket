using Carter;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCarter(); // Solo agregar Carter

var app = builder.Build();

// Habilita la redirección HTTPS
app.UseHttpsRedirection();

// Mapear rutas de Carter
app.MapCarter();

// Servir archivos estáticos (CSS, JS, imágenes)
app.UseStaticFiles();

// Middleware para manejar rutas no encontradas
app.Use(async (context, next) =>
{
    await next(); // Intenta procesar la solicitud

    if (context.Response.StatusCode == 404) // Si no se encontró una ruta válida
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync("wwwroot/views/error.html");
    }
});

app.Run();
