using System;
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

    public static int ReturnMaxInArray(int[] nums)
    {
        int max = nums[0];

        for (int i = 0; i < nums.Length; i++)
        {
            if (nums[i] > max)
            {
                max = nums[i];
            }
        }

        return max;
    }

    public static string ReversedString(string word)
    {
        char[] stringArray = word.ToCharArray();

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


        var sb = new StringBuilder();
        sb.Append(stringArray);
        
        return sb.ToString();
    }
}
