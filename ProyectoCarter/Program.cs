using Carter;

var builder = WebApplication.CreateBuilder(args);

// Agregar Carter al contenedor de servicios
builder.Services.AddCarter();

var app = builder.Build();

// Servir archivos estáticos (CSS, JS, imágenes)
app.UseStaticFiles();

// Habilita la redireccion HTTPS
app.UseHttpsRedirection();

// Mapear rutas de Carter
app.MapCarter();

app.Run();
