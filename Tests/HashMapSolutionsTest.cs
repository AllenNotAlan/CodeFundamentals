using Xunit;
using CodeFundamentals;

namespace CodeFundamentals.Tests
{
    public class HashMapSolutionsTest
    {
        [Fact]
        public void TestDict_ReturnHashMap_ReturnCountOfEachValue()
        {
            //arrange
            int[] input = { 1, 2, 3, 3, 3 };
            var expectedResult = new Dictionary<int, int>()
            {
                [1] = 1,
                [2] = 1,
                [3] = 3,
            };
            
            //act
            var result = HashMapSolutions.TestDict(input);

            //assert
            Assert.Equal(expectedResult, result);
        }

        [Fact]
        public void ReturnHashSetTest_Success()
        {
            int[] input = { 5, 6, 6, 6, 7, 8, 9, 9, 9 };

            var expectedResult = new HashSet<int>()
            {
                5, 6, 7, 8, 9
            };

            var result = HashMapSolutions.TestHashSet(input);

            Assert.Equal(expectedResult, result);
        }

        //Dictionary Test - return key = number, value = array position

        [Fact]
        public void ReturnDictionaryTest_Success()
        {
            int[] input = { 1, 2, 3, 4, };
            var expectedResult = new Dictionary<int, int>()
            {
                [1] = 0,
                [2] = 1,
                [3] = 2,
                [4] = 3
            };

            var result = HashMapSolutions.ReturnArrayAndNumberPosition(input);

            Assert.Equal(expectedResult, result);
        }

        [Fact]
        public void ReturnTwoSumArraySolutions_Success()
        {
            int[] input = { 3, 2, 4 };
            int[] expectedResult = { 1, 2 };

            var result = HashMapSolutions.TwoSumSolution_2(input, 6);

            Assert.Equal(expectedResult, result);
        }

        [Fact]
        public void IsAnagram_NotAnagram_DiffLength_ReturnFalse()
        {
            //arrange
            string s = "Test";
            string t = "Tes";

            //act
            var result = HashMapSolutions.IsAnagram(s, t);

            //assert
            Assert.Equal(false, result);
        }

        [Fact]
        public void IsAnagram_NotAnagram_DiffNumberOfChars_ReturnFalse()
        {
            //arrange
            string s = "Test";
            string t = "Teet";

            //act
            var result = HashMapSolutions.IsAnagram(s, t);

            //assert
            Assert.Equal(false, result);
        }

        [Fact]
        public void IsAnagram_Optimised_NotAnagram_DiffNumberOfChars_ReturnFalse()
        {
            //arrange
            string s = "Test";
            string t = "Teet";

            //act
            var result = HashMapSolutions.IsAnagram_optimised(s, t);

            //assert
            Assert.Equal(false, result);
        }
    }
}
