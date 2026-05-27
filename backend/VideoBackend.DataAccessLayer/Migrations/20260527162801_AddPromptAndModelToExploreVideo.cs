using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VideoBackend.DataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddPromptAndModelToExploreVideo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Model",
                table: "ExploreVideos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Prompt",
                table: "ExploreVideos",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Model",
                table: "ExploreVideos");

            migrationBuilder.DropColumn(
                name: "Prompt",
                table: "ExploreVideos");
        }
    }
}
