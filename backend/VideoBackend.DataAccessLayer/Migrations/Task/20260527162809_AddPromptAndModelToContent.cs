using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VideoBackend.DataAccessLayer.Migrations.Task
{
    /// <inheritdoc />
    public partial class AddPromptAndModelToContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Model",
                table: "Contents",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Prompt",
                table: "Contents",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Model",
                table: "Contents");

            migrationBuilder.DropColumn(
                name: "Prompt",
                table: "Contents");
        }
    }
}
