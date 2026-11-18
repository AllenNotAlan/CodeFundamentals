using Xunit;
using CodeFundamentals;

namespace CodeFundamentals.Tests;

public class ArraysSolutionTests
{
    //Test for returning the maximum in the array
    [Fact]
    public void ReturnMaxNumberInArray_ReturnMaxNumber()
    {
        //Arrange
        int[] input = { 1, 3, 5, 7 };
        int expected = 7;

        //Act
        int solution = ArraysSolution.ReturnMaxNumberInArray(input);

        //Assert
        Assert.Equal(expected, solution);
    }

    [Fact]
    public void ReturnMaxNumberInArray_ReturnMaxNumber_MiddleOfArray()
    {
        int[] input = { 2, 1, 22, 21, 18};
        int expected = 22;

        int solution = ArraysSolution.ReturnMaxNumberInArray(input);

        Assert.Equal((int)expected, solution);
    }

    [Fact]
    public void ReturnRunningSumOfArray_ReturnsCorrectArray()
    {
        int[] input = { 1, 2, 3, 4 };
        int[] expected = { 1, 3, 6, 10 };

        int[] solution = ArraysSolution.RunningSumOfArray(input);

        Assert.Equal(expected, solution);
    }

    [Fact]
    public void ReverseArray_ReturnCorrect()
    {
        int[] input = { 1, 2, 3, 4 };
        int[] expected = { 4, 3, 2, 1 };

        //act
        int[] solution = ArraysSolution.ReverseArray(input);

        Assert.Equal(expected, solution);
    }

    [Fact]
    public void IsPalindrome_ReturnFalse()
    {
        //arrange
        string input = "Hello";
        bool expected = false;

        //act
        bool solution = ArraysSolution.IsPalindrome(input);

        //assert
        Assert.Equal(expected, false);
    }


    [Fact]
    public void IsPalindrome_ReturnTrue()
    {
        //arrange
        string input = "HIIh";
        bool expected = true;

        //act
        bool solution = ArraysSolution.IsPalindrome(input);

        //assert
        Assert.Equal(expected, solution);
    }

    [Fact]
    public void IsPalindrome_WithNonAlphaNumericChars_ReturnTrue()
    {
        //arrange
        string input = "A man, a plan, a canal: Panama";
        bool expected = true;

        //act
        bool solution = ArraysSolution.IsPalindrome(input);

        //assert
        Assert.Equal(expected, solution);
    }

    [Fact]
    public void ReturnProductOfArrayExceptSelf_ReturnSuccess()
    {
        int[] input = { 1, 2, 3, 4 };


        int[] solution = ArraysSolution.ReturnProductOfArrayExceptSelf(input);

    }

    [Fact]
    public void ReturnSumOf1DArray_ReturnSumArray()
    {
        int[] input = { 1, 2, 3, 4 };
        int[] expected = { 1, 3, 6, 10 };

        //act
        int[] solution = ArraysSolution.ReturnRunningSumOfArray(input);

        Assert.Equal(expected, solution);
    }

    [Fact]
    public void TwoSumArray_ReturnSuccess()
    {
        int[] inputArray = { 3, 2, 4 };
        int inputTarget = 6;
        int[] expectedArray = { 1, 2 };

        //act
        int[] solution = ArraysSolution.TwoSumArray(inputArray, inputTarget);

        //assert
        Assert.Equal(expectedArray, solution);
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
