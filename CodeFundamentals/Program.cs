using System;

class Program
{
    static void Main(string[] args)
    {
        int[] arr = [1,2,3,4];

        // returnProductArrayExceptSelf(arr);
        returnProductArr(arr);
    }


    public static int[] returnProductArrayExceptSelf(int[] nums)
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

    public static int[] returnProductArr(int[] nums)
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

}