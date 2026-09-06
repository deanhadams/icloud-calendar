using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace icloud_calendar_api.Migrations
{
    /// <inheritdoc />
    public partial class AddTierToApiKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Tier",
                table: "ApiKeys",
                type: "text",
                nullable: false,
                defaultValue: "Free");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Tier",
                table: "ApiKeys");
        }
    }
}
