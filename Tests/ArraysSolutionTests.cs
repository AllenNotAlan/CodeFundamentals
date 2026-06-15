using Xunit;
using CodeFundamentals;

namespace CodeFundamentals.Tests;

public class ArraysSolutionTests
{
    [Fact]
    public void ReturnProductArr_ValidInput_ReturnsCorrectProductArray()
    {
        // Arrange
        int[] input = { 1, 2, 3, 4 };
        int[] expected = { 24, 12, 8, 6 };

        // Act
        int[] result = ArraysSolution.ReturnProductArr(input);

        // Assert
        Assert.Equal(expected, result);
    }

    [Fact]
    public void ReturnProductArrayExceptSelf_ValidInput_ReturnsCorrectProductArray()
    {
        // Arrange
        int[] input = { 1, 2, 3, 4 };
        int[] expected = { 24, 12, 8, 6 };

        // Act
        int[] result = ArraysSolution.ReturnProductArrayExceptSelf(input);

        // Assert
        Assert.Equal(expected, result);
    }
}
