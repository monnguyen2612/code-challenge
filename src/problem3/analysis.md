# Problem 3: Messy React

### 1. **Logic Errors in Filtering**
```tsx
const sortedBalances = useMemo(() => {
  return balances.filter((balance: WalletBalance) => {
    const balancePriority = getPriority(balance.blockchain);
    if (lhsPriority > -99) {  // ❌ lhsPriority is undefined
      if (balance.amount <= 0) {
        return true;  // ❌ Returns true for negative/zero amounts
      }
    }
    return false  // ❌ Always returns false for positive amounts
  })
}, [balances, prices]);
```

**Issues:**
- `lhsPriority` is undefined (should be `balancePriority`)
- Logic is inverted - returns `true` for negative/zero amounts, `false` for positive amounts
- This means only negative/zero balances are kept, which is likely not intended

### 2. **Unused Dependencies in useMemo**
```tsx
const sortedBalances = useMemo(() => {
  // ... filtering and sorting logic
}, [balances, prices]); // prices is not used in the calculation
```

**Issue:** `prices` is included in dependencies but never used in the calculation, causing unnecessary re-computations.

### 3. **Inefficient Sorting Logic**
```tsx
.sort((lhs: WalletBalance, rhs: WalletBalance) => {
  const leftPriority = getPriority(lhs.blockchain);
  const rightPriority = getPriority(rhs.blockchain);
  if (leftPriority > rightPriority) {
    return -1;
  } else if (rightPriority > leftPriority) {
    return 1;
  }
  // ❌ Missing return 0 for equal priorities
});
```

**Issue:** Missing return statement for equal priorities, which can cause inconsistent sorting.

### 4. **Redundant Data Processing**
```tsx
const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
  return {
    ...balance,
    formatted: balance.amount.toFixed()
  }
})

const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
  // ❌ Using sortedBalances instead of formattedBalances
  // ❌ Type mismatch: sortedBalances contains WalletBalance, not FormattedWalletBalance
```

**Issues:**
- Creates `formattedBalances` but doesn't use it
- Uses `sortedBalances` in the rows mapping, causing type errors
- Processes data twice unnecessarily

### 5. **Poor Key Usage in Lists**
```tsx
<WalletRow 
  className={classes.row}
  key={index}  // ❌ Using array index as key
  // ...
/>
```

**Issue:** Using array index as React key can cause rendering issues when items are reordered or filtered.

### 6. **Missing Error Handling**
- No error handling for `useWalletBalances()` and `usePrices()` hooks
- No validation for balance data structure
- No handling for missing prices

### 7. **Type Safety Issues**
```tsx
const getPriority = (blockchain: any): number => {  // ❌ Using 'any' type
```

**Issue:** Using `any` type defeats the purpose of TypeScript and can lead to runtime errors.

### 8. **Unused Variables**
```tsx
const { children, ...rest } = props;  // ❌ children is extracted but never used
```

### 9. **Inefficient Price Lookup**
```tsx
const usdValue = prices[balance.currency] * balance.amount;
```

**Issue:** No null/undefined check for price lookup, could cause NaN results.

### 10. **Missing Memoization for Expensive Operations**
- `formattedBalances` calculation is not memoized
- `rows` calculation is not memoized
- Price calculations are repeated on every render

## Recommended Improvements

### 1. **Fix Logic Errors**
- Correct the filtering logic to keep positive balances
- Fix the undefined variable reference
- Add proper return statement in sort function

### 2. **Optimize Dependencies**
- Remove unused dependencies from useMemo
- Add proper dependency arrays

### 3. **Improve Type Safety**
- Replace `any` with proper types
- Add proper interfaces for blockchain types

### 4. **Add Error Handling**
- Add try-catch blocks for data fetching
- Add validation for data structures
- Handle missing prices gracefully

### 5. **Optimize Performance**
- Memoize expensive calculations
- Use proper React keys
- Combine data processing steps

### 6. **Clean Up Code**
- Remove unused variables
- Fix type mismatches
- Improve code organization 