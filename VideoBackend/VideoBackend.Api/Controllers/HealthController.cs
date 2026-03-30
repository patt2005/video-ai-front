using Microsoft.AspNetCore.Mvc;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("/api/health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("Everything is ok.");
    }
}