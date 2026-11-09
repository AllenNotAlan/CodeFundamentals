using System.Numerics;
using System.Text;

//namespace - this gives Program.cs access to this class
namespace CodeFundamentals;

public class ArraysSolution
{
    //Find the maximum in the array
    //Return the largest number in the array and the index
    public static int ReturnMaxNumberInArray(int[] array)
    {
        int max = array[0];
        for (int i = 0; i < array.Length; i++)
        {
            Console.WriteLine($"Index: {i}, Value: {array[i]}");

            if (max < array[i])
            {
                max = array[i];
            }
        }

        return max;
    }

    //Used for the running sum array LeetCode question
    public static int[] RunningSumOfArray(int[] array)
    {
        int[] solution = new int[array.Length];
        solution[0] = array[0];
        for (int i = 1; i < array.Length; i++)
        {
            solution[i] = solution[i - 1] + array[i];
        }

        ArrayPrinter(solution);

        return solution;
    }

    public static int[] ReverseArray(int[] array)
    {

        int left = 0;
        int right = array.Length - 1;

        while (left < right)
        {
            int leftVal = array[left];

            array[left] = array[right];
            array[right] = leftVal;
            left++;
            right--;
        }

        return array;
    }

    //Check if a string is a palindrome
    public static bool IsPalindrome(string s)
    {

        //START: remove non-alphanumeric characters from input string
        var cleanInput = new StringBuilder();

        for (int i = 0; i < s.Length; i++)
        {
            char character = s[i];
            if (char.IsLetterOrDigit(character))
            {
                cleanInput.Append(character);
            }
        }

        var cleanInputString = cleanInput.ToString().ToLower();

        //END

        //START: create a new reversed string
        StringBuilder sb = new StringBuilder();
        string reversedString;
        int maxIndex = cleanInputString.Length - 1;
        int start = 0;

        while (maxIndex >= start)
        {
            sb.Append(cleanInputString[maxIndex]);
            maxIndex--;
        }

        reversedString = sb.ToString();

        //END

        //START: Check if the input string and the reversed string are equal/identical
        if (cleanInputString == reversedString)
        {
            return true;
        }

        return false;
    }

    public static int[] ReturnProductOfArrayExceptSelf(int[] nums)
    {
        int n = nums.Length;
        int[] result = new int[n];

        //find the right product values

        int[] right = new int[n];
        right[n - 1] = 1;
        for (int i = n - 2; i >= 0; i--)
        {
            right[i] = nums[i + 1] * right[i + 1];
        }


        //find the left product values
        int[] left = new int[n];
        left[0] = 1;
        for (int i = 1; i < n; i++)
        {
            left[i] = left[i - 1] * nums[i - 1];
        }

        for (int i = 0; i < n; i++)
        {
            result[i] = left[i] * right[i];
        }


        //multiplay left and right per index position

        return result;
    }

    public static int[] ReturnRunningSumOfArray(int[] input) 
    {
        int[] result = new int[input.Length];

        result[0] = input[0];
        for (int i = 1; i < result.Length; i++)
        {
            result[i] = result[i - 1] + input[i];
        }

        return result;
    }

    public static int[] TwoSumArray(int[] array, int target)
    {
        int[] solution = new int[2];

        for (int i = 0; i < array.Length; i++)
        {
            for(int j = i + 1; j < array.Length; j++)
            {
                if (array[i] + array[j] == target)
                {
                    solution[0] = i;
                    solution[1] = j;
                }
            }
        }

        return solution;
    }

    private static void ArrayPrinter(int[] array)
    {
        for (int i = 0; i < array.Length; i++)
        {
            Console.WriteLine(array[i]);
        }
    }
}
