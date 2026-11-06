using System;
using System.Collections.Generic;
using System.Text;

namespace CodeFundamentals;

public class HashMapSolutions
{
    public static Dictionary<int, int> TestDict(int[] nums)
    {
        var result = new Dictionary<int, int>();

        foreach (int i in nums)
        {
            if (!result.ContainsKey(i))
            {
                result[i] = 0;
            }

            result[i]++;
        }

        return result;
    }

    public static Dictionary<int,int> ReturnArrayAndNumberPosition(int[] nums)
    {
        var dict = new Dictionary<int, int>();

        for (int i = 0; i < nums.Length; i++)
        {
            dict[nums[i]] = i;
        }

        return dict;
    }

    public static int[] TwoSumSolution_1(int[] nums, int target)
    {
        //create a dictionary - this will store the array value and it's position within the array:
        //key = number, value = array position
        //For example if [1,2,3,4] the dict will be [1] = 0, [2] = 1, etc.
        var dict = new Dictionary<int, int>();

        for (int i = 0; i < nums.Length; i++)
        {
            //get the diff
            int diff = target - nums[i];

            //if already in the dict, then we have both positions of values that add up to the target
            if (dict.ContainsKey(diff))
            {
                return new int[] { dict[diff], i };
            }


            //store the key/value pair
            dict[nums[i]] = i;
        }

        return Array.Empty<int>();
    }

    public static int[] TwoSumSolution_2(int[]nums, int target)
    {
        var dict = new Dictionary<int, int>();
        int[] solution = new int[2];

        for (int i = 0; i < nums.Length; i++)
        {
            dict[nums[i]] = i;
        }

        for (int i = 0; i < nums.Length; i++)
        {
            int diff = target - nums[i];
            if (dict.ContainsKey(diff))
            {
                solution[0] = i;
                solution[1] = dict[diff];
                return solution;
            }
        }

        return Array.Empty<int>();
    }

    //public static int[] TwoSum(int[] nums, int target)
    //{
    //    //create a dict
    //    var seen = new Dictionary<int, int>();

    //    for (int i = 0; i < nums.Length; i++)
    //    {
    //        //the difference between the two values
    //        //This has guarantees one of the two values that we need which is nums[i].
    //        int diff = target - nums[i];

    //        /**
    //         * If diff is present, then that means it is our second value.
    //         */
    //        if (seen.ContainsKey(diff))
    //        {
    //            return new int[] { diff, i };
    //        }

    //        //The number is the key, the value is the position in the array
    //        seen[nums[i]] = i;
    //    }

    //    return Array.Empty<int>();

    //}

    public static HashSet<int> TestHashSet(int[] nums)
    {
        var result = new HashSet<int>();

        foreach(int i in nums)
        {
            result.Add(i);
        }

        return result;
    }

    public static bool CheckArrayForDuplicates(int[] nums)
    {
        var set = new HashSet<int>();

        foreach(int i in nums)
        {
            if (set.Contains(i))
            {
                return true;
            }

            set.Add(i);
        }

        return false;
    }

    public static bool IsAnagram(string s, string t)
    {

        //1. Check if the strings have the same length - if no then return false
        if (s.Length != t.Length)
        {
            return false;
        }

        string firstString = s.ToLowerInvariant();
        string secondString = t.ToLowerInvariant();

        //Create a dictionary: count of each char element. e.g.: 'a': 2, 'b': 1, etc.
        var sDictionary = new Dictionary<char, int>();

        for (int i = 0; i < s.Length; i++)
        {
            //If not in the dictionary yet, then set it and initialise value to 0
            if (!sDictionary.ContainsKey(firstString[i]))
            {
                sDictionary[firstString[i]] = 0;
            }

            //Increment the count of char - e.g. if a is already in then add +1, if not already in (previous step adds it) and +1
            sDictionary[firstString[i]]++;
        }

        //Iterate through the second string and check each element against the dictionary. If found, then decrement. i.e. if a is found then -1. 
        //Eventually it will reduce to zero. Meaning if successfully set to 0 for all keys, then it is an anagram
        foreach(char c in t)
        {
            if (!sDictionary.ContainsKey(c) || sDictionary[c] == 0)
            {
                return false;
            }

            sDictionary[c]--;
        }

        return true;
    }

    public static bool IsAnagram_optimised(string s, string t)
    {
        string firstString = s.ToLowerInvariant();
        string secondString = t.ToLowerInvariant();


        if (s.Length != t.Length)
        {
            return false;
        }

        int[] count = new int[26];

        for (int i = 0; i < s.Length; i++)
        {
            count[firstString[i] - 'a']++;
            count[secondString[i] - 'a']--;
        }

        foreach (int c in count)
        {
            if (c != 0)
            {
                return false;
            }
        }


        return true;
    }

    public static bool IsAna_Test(string s, string t)
    {
        //First basic check is to check if the strings match in length - if not then it's not an anagram

        if(s.Length != t.Length)
        {
            return false;
        }

        var firstStringDict = new Dictionary<char, int>();

        for (int i = 0; i < s.Length; i++)
        {
            //Check if the char/letter is in the dictionary. If not already there then initialise it and set to 0
            if (!firstStringDict.ContainsKey(s[i]))
            {
                firstStringDict[s[i]] = 0;
            }

            //Increment the count of char - e.g. if a is already in then add +1, if not already in (previous step adds it) and +1
            firstStringDict[s[i]]++;
        }

        foreach (char c in t)
        {
            if(!firstStringDict.ContainsKey(c) || firstStringDict[c] == 0)
            {
                return false;
            }

            firstStringDict[c]--;
        }

        return true;

    }
}

