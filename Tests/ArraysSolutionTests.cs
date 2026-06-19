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

    [Fact]
    public void ReturnMaxNumer_ValidInput_ReturnsCorrectNum()
    {
        int[] input = { 1, 2, 3, 4, 5 };
        int maxNumExpected = 5;

        int result = ArraysSolution.MaxValueFinder(input);

        Assert.Equal(result, maxNumExpected);
    }

    [Fact]
    public void ReturnMaxNumber_ValidInput_ReturnValueMiddleOfArray()
    {
        int[] input = { 1, 5, 6, 10, 2, 4 };
        int maxNumExpected = 10;

        int result = ArraysSolution.MaxValueFinder(input);

        Assert.Equal(result, maxNumExpected);
    }

    [Fact]
    public void ReverseString_ValidInput_ReturnReversedString()
    {
        string input = "hello";
        string expectedResult = "olleh";

        string result = ArraysSolution.ReverseString(input);

        Assert.Equal(result, expectedResult);
    }

    [Fact] 
    public void ReverseString_Test_ValidInput_ReturnReversedString()
    {
        string input = "hello";
        string expectedResult = "olleh";

        string result = ArraysSolution.ReverseString_New(input);

        Assert.Equal(result, expectedResult);
    }

    [Fact]
    public void ReverseString_Tuple_ValidInput_ReturnReversedString()
    {
        string input = "allen";
        string expectedResult = "nella";

        string result = ArraysSolution.ReverseString_Tuple(input);

        Assert.Equal (expectedResult, result);
    }

    [Fact]
    public void ReturnProductOfArray_Valid_Success()
    {
        int[] input = { 10, 2, 30};
        int expectedResult = 42;

        int result = ArraysSolution.ReturnProductOfArray(input);

        Assert.Equal(expectedResult, result);
    }
}
