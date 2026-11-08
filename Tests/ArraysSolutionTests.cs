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

    [Fact]
    public void RunningSumArray_ValidInput_ReturnMaxValue()
    {
        //arrange
        int[] input = { 1, 2, 3, 4, 5 };
        int expectedMax = input.Sum();

        //act
        int result = ArraysSolution.ReturnSumArray(input)[input.Length - 1];

        //assert
        Assert.Equal(expectedMax, result);
    }

    [Fact]
    public void RunningSumArray_ValidInput_ReturnCorrectArray()
    {
        //arrange
        int[] input = { 1, 2, 3, 4 };
        int[] expectedResult = { 1, 3, 6, 10 };

        //act
        int[] result = ArraysSolution.ReturnSumArray(input);

        //assert
        Assert.Equal(expectedResult, result);
    }

    [Fact]
    public void CheckPalindrome_NotPalindrome_ReturnFalse()
    {
        //arrange
        string input = "hello";
        bool expectedResult = false;

        //act
        bool result = ArraysSolution.CheckIfPalindrome(input);

        //assert
        Assert.Equal(expectedResult, result);
    }

    [Fact]
    public void CheckPalindrome_IsPalindrome_ReturnTrue()
    {
        //arrange
        string input = "ihhhhi";

        //act
        bool result = ArraysSolution.CheckIfPalindrome(input);
        
        //assert
        Assert.Equal(true, result);
    }

    [Fact]
    public void CheckPalindrome_IsPalindromeWithUpperCase_ReturnTrue()
    {
        //arrange
        string input = "iHhhhi";

        //act
        bool result = ArraysSolution.CheckIfPalindrome(input);
        
        //assert
        Assert.Equal(true, result);
    }
    
    [Fact]
    public void CheckPalindromeImproved_NotPalindrome_ReturnFalse()
    {
        //arrange
        string input = "hello";
        bool expectedResult = false;

        //act
        bool result = ArraysSolution.CheckIfPalindrome_Improved(input);

        //assert
        Assert.Equal(expectedResult, result);
    }

    [Fact]
    public void CheckPalindromeImproved_IsPalindrome_ReturnTrue()
    {
        //arrange
        string input = "ihhhhi";

        //act
        bool result = ArraysSolution.CheckIfPalindrome_Improved(input);
        
        //assert
        Assert.Equal(true, result);
    }

    [Fact]
    public void CheckPalindromeImproved_IsPalindromeWithUpperCase_ReturnTrue()
    {
        //arrange
        string input = "iHhhhi";

        //act
        bool result = ArraysSolution.CheckIfPalindrome_Improved(input);
        
        //assert
        Assert.Equal(true, result);
    }
    
    [Fact]
    public void CheckPalindromeFinal_NotPalindrome_ReturnFalse()
    {
        //arrange
        string input = "hello";
        bool expectedResult = false;

        //act
        bool result = ArraysSolution.CheckIfPalindrome_Final2_0(input);

        //assert
        Assert.Equal(expectedResult, result);
    }

    [Fact]
    public void CheckPalindromeFinal_IsPalindrome_ReturnTrue()
    {
        //arrange
        string input = "ihhhhi";

        //act
        bool result = ArraysSolution.CheckIfPalindrome_Final2_0(input);
        
        //assert
        Assert.Equal(true, result);
    }

    [Fact]
    public void CheckPalindromeFinal_IsPalindromeWithUpperCase_ReturnTrue()
    {
        //arrange
        string input = "iHhhhi";

        //act
        bool result = ArraysSolution.CheckIfPalindrome_Final2_0(input);
        
        //assert
        Assert.Equal(true, result);
    }

    [Fact]
    public void CheckPalindromeFinal_IsNotPalindrome_ReturnFalse()
    {
        //arrange
        string input = "asbcdefg";

        //act
        bool result = ArraysSolution.CheckIfPalindrome_Final2_0(input);
        
        //assert
        Assert.Equal(false, result);

    }
}
