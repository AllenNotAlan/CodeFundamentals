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
    
    //Test For max num in Array

    [Fact]
    public void ReturnMaxInArray_ValidInput_ReturnCorrectMaxNum()
    {
        //Arrange
        int[] input = { 1, 10, 50, 20 };
        int expected = 50;
        
        //Act
        int result = ArraysSolution.ReturnMaxInArray(input);
        
        //Assert
        Assert.Equal(expected, result);
    }

    [Fact]
    public void ReturnMaxInArray_ValidInput_DuplicateMax_ReturnCorrectMaxNum()
    {
        //Arrange
        int[] input = { 1, 10, 50, 50, 20, 20, 50 };
        int expected = 50;
        
        //Act
        int result = ArraysSolution.ReturnMaxInArray(input);
        
        //Assert
        Assert.Equal(expected, result);
    }

    [Fact]
    public void ReversedString_ValidInput_ReturnCorrectString()
    {
        //Arrange
        string input = "hello";
        string expected = "olleh";
        
        //Act
        string result = ArraysSolution.ReversedString(input);
        
        //Assert
        Assert.Equal(expected,result);
    }
}
