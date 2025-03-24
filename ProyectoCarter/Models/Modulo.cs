namespace ProyectoCarter.Models
{
    public class Modulo
    {
        public int id { get; set; }  // Nota: en minúscula para coincidir con el JSON
        public string nombre { get; set; }  // Cambiado de NombreModulo a nombre
        public string ruta { get; set; }
        public string icono { get; set; }
        public int orden { get; set; }
    }
}
