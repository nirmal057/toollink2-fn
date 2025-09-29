// Frontend test for warehouse categories
// Run this in the browser console after logging in

async function testWarehouseCategoriesFromBrowser() {
    console.log('🧪 Testing Warehouse Categories from Browser...\n');

    try {
        // Get access token from localStorage
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            console.error('❌ No access token found. Please login first.');
            return;
        }
        console.log('✅ Access token found');

        // Test 1: Get regular inventory stats
        console.log('\n📊 Testing regular inventory stats...');
        const statsResponse = await fetch('http://localhost:5001/api/inventory/stats', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log('✅ Inventory stats:', {
                totalItems: statsData.data.totalItems,
                categories: statsData.data.categories,
                warehouseSpecific: statsData.data.warehouseSpecific,
                categoryDistribution: statsData.data.categoryDistribution?.length
            });
        } else {
            console.error('❌ Stats request failed:', statsResponse.status);
        }

        // Test 2: Get warehouse-specific categories
        console.log('\n🏭 Testing warehouse categories...');
        const warehouseCategoriesResponse = await fetch('http://localhost:5001/api/inventory/warehouse-categories', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (warehouseCategoriesResponse.ok) {
            const warehouseData = await warehouseCategoriesResponse.json();
            console.log('✅ Warehouse categories:', {
                userRole: warehouseData.data.userRole,
                warehouse: warehouseData.data.warehouse,
                categoriesCount: warehouseData.data.categories?.length,
                allWarehousesKeys: Object.keys(warehouseData.data.allWarehouses || {})
            });

            if (warehouseData.data.categories) {
                console.log('📋 Categories for this warehouse:');
                warehouseData.data.categories.forEach(cat => {
                    console.log(`  - ${cat._id}: ${cat.count} items (${cat.totalStock} total stock)`);
                });
            }

            if (warehouseData.data.allWarehouses) {
                console.log('🏢 All warehouses (admin view):');
                Object.entries(warehouseData.data.allWarehouses).forEach(([warehouse, categories]) => {
                    console.log(`  ${warehouse}: ${categories.length} categories`);
                });
            }
        } else {
            console.error('❌ Warehouse categories request failed:', warehouseCategoriesResponse.status);
        }

        console.log('\n🎉 Test completed!');
    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
    testWarehouseCategoriesFromBrowser();
}

// Export for manual execution
window.testWarehouseCategories = testWarehouseCategoriesFromBrowser;
