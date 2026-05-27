using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VideoBackend.DataAccessLayer.Migrations.Task
{
    /// <inheritdoc />
    public partial class AddPoyoTaskId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Content_ContentId",
                table: "Tasks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Content",
                table: "Content");

            migrationBuilder.RenameTable(
                name: "Content",
                newName: "Contents");

            migrationBuilder.AddColumn<string>(
                name: "PoyoTaskId",
                table: "Tasks",
                type: "text",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Contents",
                table: "Contents",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Contents_ContentId",
                table: "Tasks",
                column: "ContentId",
                principalTable: "Contents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Contents_ContentId",
                table: "Tasks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Contents",
                table: "Contents");

            migrationBuilder.DropColumn(
                name: "PoyoTaskId",
                table: "Tasks");

            migrationBuilder.RenameTable(
                name: "Contents",
                newName: "Content");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Content",
                table: "Content",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Content_ContentId",
                table: "Tasks",
                column: "ContentId",
                principalTable: "Content",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
