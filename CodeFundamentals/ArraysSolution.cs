using System;
using System.Globalization;
using System.Text;

//namespace - this gives Program.cs access to this class
namespace CodeFundamentals;

public class ArraysSolution
{
    public static int[] ReturnProductArrayExceptSelf(int[] nums)
    {
        int n = nums.Length;
        int[] ints = new int[n];
        
        int[] left = new int[n];
        int[] right = new int[n];

        left[0] = 1;
        for(int i = 1; i < n; i++)
        {
            left[i] = left[i - 1] * nums[i-1];

            Console.WriteLine("left:"+left[i]);
        }

        right[n - 1] = 1;
        for(int i = n-2; i >= 0; i--)
        {
            right[i] = right[i+1] * nums[i+1];
            Console.WriteLine("right:"+right[i]);
        }

        for(int i = 0; i < n; i++)
        {
            ints[i] = left[i] * right[i];

            Console.WriteLine("sol:" + ints[i]);

        }

        return ints;
    }

    public static int[] ReturnProductArr(int[] nums)
    {
        int n = nums.Length;

        int[] left = new int[n];
        int[] right = new int[n];

        int[] solution = new int[n];

        left[0] = 1;
        for(int i = 1; i < n; i++)
        {
            left[i] = left[i - 1] * nums[i - 1];

            Console.WriteLine("left:"+left[i]);
        }

        right[n-1] = 1;
        for (int i = n-2; i >= 0; i--)
        {
            right[i] = right[i + 1] * nums[i + 1];
            Console.WriteLine("right:" + right[i]);
        }

        for(int i=0; i < n; i++)
        {
            solution[i] = left[i] * right[i];

            Console.WriteLine("Solution:" + solution[i]);
        }

        return solution;
    }

    public static int MaxValueFinder(int[] nums)
    {
        var arrayLength = nums.Length;
        var maxNum = nums[0];

        for(int i = 0; i < arrayLength; i++)
        {
            if (nums[i] > maxNum)
            {
                maxNum = nums[i];
            }
        }

        return maxNum;
    }

    public static string ReverseString(string input)
    {
        var sb = new StringBuilder();

        for (int i = input.Length - 1; i >= 0; i--)
        {
            sb.Append(input[i]);
        }

        return sb.ToString();
    }

    public static string ReverseString_New(string input)
    {
        char[] stringArray = input.ToArray();

        int left = 0;
        int right = stringArray.Length - 1;

        while (left < right)
        {
            var temp = stringArray[left];
            stringArray[left] = stringArray[right];
            stringArray[right] = temp;

            left++;
            right--;
        }

        return new string(stringArray);
    }

    public static string ReverseString_Tuple(string input)
    {
        char[] stringArray = input.ToCharArray();

        int left = 0;
        int right = stringArray.Length - 1;

        while (left < right)
        {
            (stringArray[left], stringArray[right]) = (stringArray[right], stringArray[left]);

            left++;
            right--;
        }

        return new string(stringArray);
    }

    public static int ReturnProductOfArray(int[] input)
    {
        int[] prefix = new int[input.Length];

        prefix[0] = input[0];

        for(int i = 1; i < input.Length; i++)
        {
            prefix[i] = prefix[i - 1] + input[i];
        }

        foreach(int x in prefix)
        {
            Console.WriteLine(x);
        }

        return prefix[input.Length - 1];
    }
}
