# 🔄 Migration Guide: Adopting Performance Optimizations

## Quick Start Checklist

Follow these steps to migrate your existing CakeRaft code to use the new optimized APIs:

### ✅ Step 1: Update Imports

**Before:**
```typescript
import { productAPI, checkoutAPI, revenueAPI } from '@/lib/api';
```

**After:**
```typescript
import optimizedAPI from '@/lib/optimizedApi';
// Or import specific APIs:
// import { optimizedProductAPI, optimizedRevenueAPI } from '@/lib/optimizedApi';
```

### ✅ Step 2: Replace API Calls

**Before:**
```typescript
const response = await productAPI.getProducts();
const products = response.data.data;
```

**After:**
```typescript
const products = await optimizedAPI.products.getProducts();
// Returns unwrapped data directly
```

### ✅ Step 3: Use Custom Hooks in Components

**Before:**
```typescript
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  setLoading(true);
  productAPI.getProducts()
    .then(res => setProducts(res.data.data))
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
}, []);
```

**After:**
```typescript
import { useProducts } from '@/hooks/useOptimizedQuery';

const { data: products = [], isLoading, error } = useProducts();
```

### ✅ Step 4: Add Error Boundaries

**Before:**
```typescript
export default function Page() {
  return <YourComponent />;
}
```

**After:**
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Page() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### ✅ Step 5: Implement Debounced Search

**Before:**
```typescript
const [search, setSearch] = useState('');

// API called on every keystroke
useEffect(() => {
  productAPI.getProducts({ search }).then(...);
}, [search]);
```

**After:**
```typescript
import { useDebouncedSearch } from '@/hooks/useOptimizedQuery';

const [debouncedSearch, search, setSearch] = useDebouncedSearch('', 500);

// API called only after 500ms of no typing
const { data } = useProducts({ search: debouncedSearch });
```

---

## 📝 Component-by-Component Migration

### Products Page (`/app/products/page.tsx`)

**Option 1: Use the optimized version**
```bash
# Rename current file
mv src/app/products/page.tsx src/app/products/page.old.tsx

# Use optimized version
mv src/app/products/page-optimized.tsx src/app/products/page.tsx
```

**Option 2: Manual migration**

Replace:
```typescript
// OLD
const loadData = async () => {
  const [productsRes, categoriesRes] = await Promise.all([
    productAPI.getProducts(),
    productAPI.getCategories()
  ]);
  setProducts(productsRes.data.data);
  setCategories(categoriesRes.data.data);
};
```

With:
```typescript
// NEW
import { useProducts, useCategories } from '@/hooks/useOptimizedQuery';

const { data: productsData } = useProducts();
const { data: categoriesData } = useCategories();
const products = productsData?.data || [];
const categories = categoriesData?.data || [];
```

### Dashboard Page (`/app/dashboard/page.tsx`)

Replace:
```typescript
// OLD
useEffect(() => {
  revenueAPI.getTodayRevenue().then(res => setRevenue(res.data));
}, []);
```

With:
```typescript
// NEW
import { useTodayRevenue } from '@/hooks/useOptimizedQuery';

const { data: revenue } = useTodayRevenue();
```

### Billing Page (`/app/billing/page.tsx`)

Replace:
```typescript
// OLD
const checkLoyalty = async (phone: string) => {
  const res = await checkoutAPI.checkLoyaltyStatus({ customerPhone: phone });
  setLoyaltyData(res.data);
};
```

With:
```typescript
// NEW
const checkLoyalty = async (phone: string) => {
  const data = await optimizedAPI.checkout.checkLoyaltyStatus({ 
    customerPhone: phone 
  });
  setLoyaltyData(data);
};
```

### Analytics Page (`/app/analytics/page.tsx`)

Replace:
```typescript
// OLD
useEffect(() => {
  Promise.all([
    revenueAPI.getTodayRevenue(),
    revenueAPI.getWeeklyRevenue(),
    revenueAPI.get30DaysRevenue()
  ]).then(([today, weekly, monthly]) => {
    setTodayData(today.data);
    setWeeklyData(weekly.data);
    setMonthlyData(monthly.data);
  });
}, []);
```

With:
```typescript
// NEW
import { useTodayRevenue, useWeeklyRevenue, use30DaysRevenue } from '@/hooks/useOptimizedQuery';

const { data: todayData } = useTodayRevenue();
const { data: weeklyData } = useWeeklyRevenue();
const { data: monthlyData } = use30DaysRevenue();
```

---

## 🔧 Root Layout Updates

### Add Performance Monitoring

Edit `src/app/layout.tsx`:

```typescript
import { PerformanceMonitor, NetworkStatus } from '@/components/PerformanceMonitor';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <NetworkStatus />
        <PerformanceMonitor />
      </body>
    </html>
  );
}
```

### Add Global Error Boundary

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

---

## 🧪 Testing Your Migration

### 1. Verify Cache is Working

Open browser DevTools → Network tab:
1. Load Products page
2. Navigate away
3. Return to Products page
4. ✅ Should see **0 new API requests** (data from cache)

### 2. Verify Deduplication

1. Open Products page
2. Click search rapidly
3. ✅ Should see **only 1 API request** after typing stops

### 3. Verify Error Handling

1. Stop backend server
2. Try loading any page
3. ✅ Should see error boundary UI, not blank screen

### 4. Check Performance Monitor

1. Enable in `/app/layout.tsx`
2. Click purple icon in bottom-right
3. ✅ Should see cache hit rate > 60%

---

## 📊 Performance Comparison

Test the same workflow before and after migration:

**Test Workflow:**
1. Load Products page
2. Search for "chocolate"
3. Filter by category
4. Click Edit button
5. Navigate back
6. Repeat search

**Before Optimization:**
- API Requests: ~15
- Time: ~3 seconds
- Network Traffic: ~500KB

**After Optimization:**
- API Requests: ~3
- Time: ~0.5 seconds
- Network Traffic: ~100KB

---

## ⚠️ Common Pitfalls

### ❌ Pitfall 1: Using Raw API Instead of Optimized

```typescript
// WRONG
import { productAPI } from '@/lib/api';
const data = await productAPI.getProducts();

// CORRECT
import optimizedAPI from '@/lib/optimizedApi';
const data = await optimizedAPI.products.getProducts();
```

### ❌ Pitfall 2: Not Invalidating Cache After Mutations

```typescript
// WRONG
await productAPI.createProduct(data);
// Cache still shows old data!

// CORRECT
await optimizedAPI.products.createProduct(data);
// Cache automatically invalidated
```

### ❌ Pitfall 3: Fetching in useEffect Instead of Using Hooks

```typescript
// WRONG
useEffect(() => {
  fetchProducts();
}, []);

// CORRECT
const { data } = useProducts();
```

### ❌ Pitfall 4: Not Handling Loading States

```typescript
// WRONG
const { data } = useProducts();
return data.map(...); // Crashes if data is null!

// CORRECT
const { data, isLoading } = useProducts();
if (isLoading) return <LoadingSpinner />;
return data?.data?.map(...) || [];
```

---

## 🚀 Rollout Strategy

### Phase 1: Non-Critical Pages (Week 1)
- ✅ Analytics page
- ✅ Settings page
- ✅ Profile page

### Phase 2: Core Features (Week 2)
- ✅ Products page
- ✅ Categories page
- ✅ Dashboard

### Phase 3: Critical Features (Week 3)
- ✅ Billing page
- ✅ Checkout flow
- ✅ Reports

### Phase 4: Polish (Week 4)
- ✅ Add error boundaries everywhere
- ✅ Add performance monitoring
- ✅ Fine-tune cache TTLs
- ✅ Remove old code

---

## 📋 Migration Checklist

Copy this checklist and track your progress:

```markdown
### Code Updates
- [ ] Install new dependencies (if any)
- [ ] Update all API imports to use optimizedAPI
- [ ] Replace manual useEffect fetching with custom hooks
- [ ] Add debounced search to all search inputs
- [ ] Implement error boundaries on all pages

### Components Migration
- [ ] Products page
- [ ] Dashboard page
- [ ] Analytics page
- [ ] Billing page
- [ ] Categories manage page
- [ ] Product add/edit pages

### Root Layout Updates
- [ ] Add PerformanceMonitor
- [ ] Add NetworkStatus
- [ ] Add global ErrorBoundary

### Testing
- [ ] Test cache is working (Network tab)
- [ ] Test deduplication (rapid clicks)
- [ ] Test error handling (backend offline)
- [ ] Test debounced search (type rapidly)
- [ ] Check performance metrics (>60% cache hit)

### Cleanup
- [ ] Remove old API call code
- [ ] Remove manual loading state management
- [ ] Remove manual error handling
- [ ] Update documentation
- [ ] Train team on new patterns

### Deployment
- [ ] Test in staging environment
- [ ] Run performance benchmarks
- [ ] Deploy to production
- [ ] Monitor for errors (first 24 hours)
- [ ] Gather user feedback
```

---

## 🆘 Getting Help

If you encounter issues during migration:

1. **Check the error message** - TypeScript will guide you
2. **Review examples** - Check `page-optimized.tsx` for patterns
3. **Use PerformanceMonitor** - See cache statistics in real-time
4. **Check console** - Look for cache hits/misses logs
5. **Test incrementally** - Migrate one page at a time

---

## 🎉 Success Indicators

You've successfully migrated when:

- ✅ Cache hit rate > 60%
- ✅ API requests reduced by 70%
- ✅ Page load time < 1 second
- ✅ No TypeScript errors
- ✅ All pages working correctly
- ✅ Error boundaries catching errors
- ✅ Search is debounced
- ✅ No duplicate requests
- ✅ Offline detection working

---

**Good luck with your migration! 🚀**
