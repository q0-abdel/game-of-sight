import sys
from io import StringIO
import unittest

class TestHelloWorld(unittest.TestCase):
    def test_output(self):
        # Capture the output
        captured_output = StringIO()
        sys.stdout = captured_output
        
        # Run the program
        exec(open('my-first-program.py').read())
        
        # Restore stdout
        sys.stdout = sys.__stdout__
        
        # Check if the output is correct
        self.assertEqual(captured_output.getvalue().strip(), "Hello, World!")

if __name__ == '__main__':
    unittest.main()
