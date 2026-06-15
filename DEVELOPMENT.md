# Development Guide

This guide explains how to add new solutions, create tests, and debug the project.

## 1. Adding a New Solution Class

To keep the project organized, new algorithm solutions should be added as separate classes in the `CodeFundamentals/` directory.

1. Create a new file: `CodeFundamentals/YourNewSolution.cs`.
2. Use the following boilerplate:

```csharp
namespace CodeFundamentals;

public class YourNewSolution
{
    public static int SomeAlgorithm(int[] input)
    {
        // Your logic here
        return 0;
    }
}
```

3. Call your new method from `Program.cs` for manual testing if needed.

## 2. Adding Unit Tests

Tests are located in the `Tests/` directory using the **xUnit** framework.

1. Create a new test file: `Tests/YourNewSolutionTests.cs`.
2. Add a reference to the main project and use the `[Fact]` or `[Theory]` attributes:

```csharp
using Xunit;
using CodeFundamentals;

namespace CodeFundamentals.Tests;

public class YourNewSolutionTests
{
    [Fact]
    public void SomeAlgorithm_Scenario_ExpectedResult()
    {
        // Arrange
        int[] input = { 1, 2, 3 };
        int expected = 0;

        // Act
        int result = YourNewSolution.SomeAlgorithm(input);

        // Assert
        Assert.Equal(expected, result);
    }
}
```

## 3. Running and Debugging Tests

### Running Tests
- **Terminal**: Run `dotnet test` from the root directory.
- **VS Code**: Use the **Testing Explorer** (Beaker icon) in the sidebar.

### Debugging Tests
1. Open the test file.
2. Set a breakpoint in your code or test.
3. Click the **Debug** button that appears above the `[Fact]` attribute (CodeLens) or use the **Debug** icon in the Testing Explorer.

## 4. Troubleshooting: Binary Not Found
If you get an error saying the program does not exist:
1. Ensure the `TargetFramework` in `CodeFundamentals.csproj` matches the path in `.vscode/launch.json`.
2. Run `dotnet build` to ensure the binaries are generated.
