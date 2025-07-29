// Problem 1: Three ways to sum to n
// Three unique implementations of sum_to_n function

// Method 1: Iterative approach using a loop
var sum_to_n_a = function(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

// Method 2: Mathematical formula approach (Gauss's formula)
// Formula: sum = n * (n + 1) / 2
var sum_to_n_b = function(n) {
    return (n * (n + 1)) / 2;
};

// Method 3: Recursive approach
var sum_to_n_c = function(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    return n + sum_to_n_c(n - 1);
};

// Test cases to verify all implementations work correctly
function testSumToN() {
    const testCases = [1, 5, 10, 100, 0];
    
    console.log("Testing all three implementations:");
    console.log("================================");
    
    testCases.forEach(n => {
        const resultA = sum_to_n_a(n);
        const resultB = sum_to_n_b(n);
        const resultC = sum_to_n_c(n);
        
        console.log(`n = ${n}:`);
        console.log(`  Method A (Iterative): ${resultA}`);
        console.log(`  Method B (Formula):   ${resultB}`);
        console.log(`  Method C (Recursive): ${resultC}`);
        console.log(`  All equal: ${resultA === resultB && resultB === resultC ? '✅' : '❌'}`);
        console.log("");
    });
}

// Performance comparison
function performanceTest() {
    const n = 1000000;
    console.log(`Performance test with n = ${n}:`);
    console.log("================================");
    
    // Test Method A (Iterative)
    const startA = performance.now();
    const resultA = sum_to_n_a(n);
    const timeA = performance.now() - startA;
    
    // Test Method B (Formula)
    const startB = performance.now();
    const resultB = sum_to_n_b(n);
    const timeB = performance.now() - startB;
    
    // Test Method C (Recursive) - Note: This will cause stack overflow for large n
    let timeC = 0;
    let resultC = 0;
    try {
        const startC = performance.now();
        resultC = sum_to_n_c(n);
        timeC = performance.now() - startC;
    } catch (e) {
        timeC = Infinity;
        resultC = "Stack Overflow";
    }
    
    console.log(`Method A (Iterative): ${timeA.toFixed(4)}ms - Result: ${resultA}`);
    console.log(`Method B (Formula):   ${timeB.toFixed(4)}ms - Result: ${resultB}`);
    console.log(`Method C (Recursive): ${timeC === Infinity ? 'Stack Overflow' : timeC.toFixed(4) + 'ms'} - Result: ${resultC}`);
}

// Run tests
if (typeof window === 'undefined') {
    // Node.js environment
    testSumToN();
    performanceTest();
} else {
    // Browser environment
    console.log("Sum to n functions loaded. Run testSumToN() or performanceTest() to test.");
} 