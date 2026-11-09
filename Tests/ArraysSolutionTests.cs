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
}
