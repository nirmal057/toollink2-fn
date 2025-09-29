// Centralized Warehouse-Category ID System Configuration
// This file defines the complete warehouse category structure with unique IDs

export interface CategoryItem {
    id: string;
    name: string;
    code: string;
    description?: string;
}

export interface WarehouseConfig {
    name: string;
    code: string;
    description: string;
    categories: CategoryItem[];
}

export const WAREHOUSE_CATEGORY_SYSTEM: Record<string, WarehouseConfig> = {
    'W1': {
        name: 'W1 - Sand & Aggregate Warehouse',
        code: 'W1',
        description: 'Sand, aggregate, and construction base materials',
        categories: [
            { id: 'W1-001', name: 'Sand & Aggregate', code: 'W1-001', description: 'General sand and aggregate category' },
            { id: 'W1-002', name: 'Fine Sand', code: 'W1-002', description: 'Fine construction sand' },
            { id: 'W1-003', name: 'Medium Sand', code: 'W1-003', description: 'Medium grain construction sand' },
            { id: 'W1-004', name: 'Coarse Sand', code: 'W1-004', description: 'Coarse grain construction sand' },
            { id: 'W1-005', name: 'River Sand', code: 'W1-005', description: 'Natural river sand' },
            { id: 'W1-006', name: 'Washed Sand', code: 'W1-006', description: 'Cleaned and washed sand' },
            { id: 'W1-007', name: 'M-Sand (Crushed Rock)', code: 'W1-007', description: 'Manufactured sand from crushed rock' },
            { id: 'W1-008', name: 'Aggregate', code: 'W1-008', description: 'Construction aggregate materials' },
            { id: 'W1-009', name: 'Gravel', code: 'W1-009', description: 'Gravel for construction and drainage' },
            { id: 'W1-010', name: 'Stone Chips', code: 'W1-010', description: 'Stone chips for concrete and road work' }
        ]
    },
    'W2': {
        name: 'W2 - Bricks & Masonry Warehouse',
        code: 'W2',
        description: 'Bricks, blocks, and masonry materials',
        categories: [
            { id: 'W2-001', name: 'Bricks & Masonry', code: 'W2-001', description: 'General bricks and masonry category' },
            { id: 'W2-002', name: 'Solid Cement Blocks', code: 'W2-002', description: 'Solid concrete construction blocks' },
            { id: 'W2-003', name: 'Hollow Cement Blocks', code: 'W2-003', description: 'Hollow concrete blocks for walls' },
            { id: 'W2-004', name: 'Clay Bricks', code: 'W2-004', description: 'Traditional fired clay bricks' },
            { id: 'W2-005', name: '4 Inch Blocks', code: 'W2-005', description: '4 inch thick concrete blocks' },
            { id: 'W2-006', name: '6 Inch Blocks', code: 'W2-006', description: '6 inch thick concrete blocks' },
            { id: 'W2-007', name: '8 Inch Blocks', code: 'W2-007', description: '8 inch thick concrete blocks' },
            { id: 'W2-008', name: 'Masonry Blocks', code: 'W2-008', description: 'Specialized masonry blocks' },
            { id: 'W2-009', name: 'Interlocking Pavers', code: 'W2-009', description: 'Interlocking concrete pavers' },
            { id: 'W2-010', name: 'Granite Slabs', code: 'W2-010', description: 'Natural granite stone slabs' },
            { id: 'W2-011', name: 'Decorative Stones', code: 'W2-011', description: 'Decorative natural stones' }
        ]
    },
    'W3': {
        name: 'W3 - Steel & Metal Warehouse',
        code: 'W3',
        description: 'Steel reinforcement and metal products',
        categories: [
            { id: 'W3-001', name: 'Steel & Reinforcement', code: 'W3-001', description: 'General steel and reinforcement category' },
            { id: 'W3-002', name: '6mm Steel Rods', code: 'W3-002', description: '6mm diameter steel reinforcement rods' },
            { id: 'W3-003', name: '8mm Steel Rods', code: 'W3-003', description: '8mm diameter steel reinforcement rods' },
            { id: 'W3-004', name: '10mm Steel Rods', code: 'W3-004', description: '10mm diameter steel reinforcement rods' },
            { id: 'W3-005', name: '12mm Steel Rods', code: 'W3-005', description: '12mm diameter steel reinforcement rods' },
            { id: 'W3-006', name: '16mm Steel Rods', code: 'W3-006', description: '16mm diameter steel reinforcement rods' },
            { id: 'W3-007', name: '20mm Steel Rods', code: 'W3-007', description: '20mm diameter steel reinforcement rods' },
            { id: 'W3-008', name: '25mm Steel Rods', code: 'W3-008', description: '25mm diameter steel reinforcement rods' },
            { id: 'W3-009', name: 'Steel Wire', code: 'W3-009', description: 'Steel binding and construction wire' },
            { id: 'W3-010', name: 'Steel Mesh', code: 'W3-010', description: 'Steel reinforcement mesh' },
            { id: 'W3-011', name: 'Steel Plates', code: 'W3-011', description: 'Steel plates for construction' },
            { id: 'W3-012', name: 'Angle Bars', code: 'W3-012', description: 'L-shaped steel angle bars' },
            { id: 'W3-013', name: 'Channel Bars', code: 'W3-013', description: 'C-shaped steel channel bars' }
        ]
    },
    'WM': {
        name: 'WM - Main Warehouse (Tools & Equipment)',
        code: 'WM',
        description: 'Tools, equipment, and miscellaneous construction materials',
        categories: [
            { id: 'WM-001', name: 'Tools & Equipment', code: 'WM-001', description: 'General tools and equipment category' },
            { id: 'WM-002', name: 'Hand Tools', code: 'WM-002', description: 'Manual hand tools' },
            { id: 'WM-003', name: 'Power Tools', code: 'WM-003', description: 'Electric and battery powered tools' },
            { id: 'WM-004', name: 'Power Drills', code: 'WM-004', description: 'Electric and cordless drills' },
            { id: 'WM-005', name: 'Grinders', code: 'WM-005', description: 'Grinding tools and equipment' },
            { id: 'WM-006', name: 'Saws', code: 'WM-006', description: 'Cutting saws and blades' },
            { id: 'WM-007', name: 'Welding Equipment', code: 'WM-007', description: 'Welding machines and accessories' },
            { id: 'WM-008', name: 'Measuring Tools', code: 'WM-008', description: 'Measurement and leveling tools' },
            { id: 'WM-009', name: 'Safety Gear', code: 'WM-009', description: 'Personal protective equipment' },
            { id: 'WM-010', name: 'Cutting Tools', code: 'WM-010', description: 'Cutting and shaping tools' },
            { id: 'WM-011', name: 'Angle Grinders', code: 'WM-011', description: 'Angle grinding machines' },
            { id: 'WM-012', name: 'Cement', code: 'WM-012', description: 'Portland cement and specialty cements' },
            { id: 'WM-013', name: 'Paint & Chemicals', code: 'WM-013', description: 'Paints, solvents, and construction chemicals' },
            { id: 'WM-014', name: 'Electrical Items', code: 'WM-014', description: 'Electrical supplies and components' },
            { id: 'WM-015', name: 'Plumbing Supplies', code: 'WM-015', description: 'Pipes, fittings, and plumbing materials' },
            { id: 'WM-016', name: 'Tiles & Ceramics', code: 'WM-016', description: 'Floor and wall tiles' },
            { id: 'WM-017', name: 'Roofing Materials', code: 'WM-017', description: 'Roofing sheets and accessories' },
            { id: 'WM-018', name: 'Hardware & Fasteners', code: 'WM-018', description: 'Bolts, screws, and hardware items' },
            { id: 'WM-019', name: 'Materials', code: 'WM-019', description: 'Miscellaneous construction materials' }
        ]
    }
};

// Utility functions for working with the warehouse-category system
export class WarehouseCategoryUtils {
    // Get all categories for a specific warehouse
    static getCategoriesForWarehouse(warehouseCode: string): CategoryItem[] {
        return WAREHOUSE_CATEGORY_SYSTEM[warehouseCode]?.categories || [];
    }

    // Get category by ID
    static getCategoryById(categoryId: string): CategoryItem | null {
        const warehouseCode = categoryId.split('-')[0];
        const warehouse = WAREHOUSE_CATEGORY_SYSTEM[warehouseCode];
        if (!warehouse) return null;

        return warehouse.categories.find(cat => cat.id === categoryId) || null;
    }

    // Get warehouse info by code
    static getWarehouseInfo(warehouseCode: string): WarehouseConfig | null {
        return WAREHOUSE_CATEGORY_SYSTEM[warehouseCode] || null;
    }

    // Generate next available category ID for a warehouse
    static getNextCategoryId(warehouseCode: string): string {
        const categories = this.getCategoriesForWarehouse(warehouseCode);
        const maxNumber = categories.reduce((max, cat) => {
            const num = parseInt(cat.id.split('-')[1]);
            return num > max ? num : max;
        }, 0);

        return `${warehouseCode}-${String(maxNumber + 1).padStart(3, '0')}`;
    }

    // Get all warehouse codes
    static getAllWarehouseCodes(): string[] {
        return Object.keys(WAREHOUSE_CATEGORY_SYSTEM);
    }

    // Get all categories across all warehouses
    static getAllCategories(): CategoryItem[] {
        return Object.values(WAREHOUSE_CATEGORY_SYSTEM)
            .flatMap(warehouse => warehouse.categories);
    }

    // Search categories by name
    static searchCategories(searchTerm: string): CategoryItem[] {
        return this.getAllCategories().filter(cat =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Get legacy category names for backward compatibility
    static getLegacyCategoriesForWarehouse(warehouseCode: string): string[] {
        return this.getCategoriesForWarehouse(warehouseCode).map(cat => cat.name);
    }
}

// Export for backward compatibility
export const WAREHOUSE_OPTIONS = [
    { key: 'W1', name: WAREHOUSE_CATEGORY_SYSTEM.W1.name, code: 'W1' },
    { key: 'W2', name: WAREHOUSE_CATEGORY_SYSTEM.W2.name, code: 'W2' },
    { key: 'W3', name: WAREHOUSE_CATEGORY_SYSTEM.W3.name, code: 'W3' },
    { key: 'WM', name: WAREHOUSE_CATEGORY_SYSTEM.WM.name, code: 'WM' }
];

export const WAREHOUSE_CATEGORIES = {
    'W1': WarehouseCategoryUtils.getLegacyCategoriesForWarehouse('W1'),
    'W2': WarehouseCategoryUtils.getLegacyCategoriesForWarehouse('W2'),
    'W3': WarehouseCategoryUtils.getLegacyCategoriesForWarehouse('W3'),
    'WM': WarehouseCategoryUtils.getLegacyCategoriesForWarehouse('WM')
};
