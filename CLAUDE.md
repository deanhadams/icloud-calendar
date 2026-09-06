# CLAUDE.md

## Project

`icloud-calendar` is a .NET 8 ASP.NET Core Web API. The application code is in `icloud-calendar-api/`; the solution file is `icloud-calendar.sln`.

## Development

Run commands from the repository root:

```powershell
dotnet restore icloud-calendar.sln
dotnet build icloud-calendar.sln
dotnet run --project icloud-calendar-api/icloud-calendar-api.csproj
```

There is currently no test project. When adding tests, use the standard `dotnet test` command against the solution or the specific test project.

## Code Conventions

- Target .NET 8 and preserve nullable reference type support.
- Follow existing ASP.NET Core patterns and keep controllers focused on HTTP concerns.
- Prefer async APIs for I/O-bound work.
- Keep configuration in `appsettings.json` or environment-specific configuration files; do not commit secrets.
- Do not edit generated output under `bin/` or `obj/`.

## Validation

Before submitting changes, run `dotnet build icloud-calendar.sln`. For behavior changes, run the relevant tests when a test project exists and exercise the API through the configured HTTP endpoints as needed.
