using System.Text.Json.Serialization;
using VideoBackend.DataAccessLayer;

var builder = WebApplication.CreateBuilder(args);

VideoBackend.DataAccessLayer.DbSession.ConnectionString =
    builder.Configuration.GetConnectionString("DefaultConnection");

var frontendCorsPolicy = "FrontendCors";

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy(frontendCorsPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(frontendCorsPolicy);
app.UseAuthorization();
app.MapControllers();

app.Run();
