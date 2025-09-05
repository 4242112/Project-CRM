import axios from 'axios';
import InvoiceService from './InvoiceService';

const API_URL = 'http://localhost:8080/api/products';

export interface Product {
    id?: number;
    name: string;
    description: string;
    price: number;
    category: string;
    status: 'Available' | 'Unavailable';
    updatedAt?: string;
}

export interface ProductPerformance {
    id: number;
    name: string;
    salesVolume: number;
    profitMargin: number;
    revenue: number;
    category: string;
}

const ProductService = {
    getAllProducts: async (): Promise<Product[]> => {
        const response = await axios.get(API_URL);
        return response.data;
    },
    
    getProductById: async (id: number): Promise<Product> => {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    },
    
    createProduct: async (product: Product): Promise<Product> => {
        const response = await axios.post(API_URL, product);
        return response.data;
    },
    
    updateProduct: async (id: number, product: Product): Promise<Product> => {
        const response = await axios.put(`${API_URL}/${id}`, product);
        return response.data;
    },
    
    deleteProduct: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/${id}`);
    },
    
    searchProductsByName: async (name: string): Promise<Product[]> => {
        const response = await axios.get(`${API_URL}/search?name=${name}`);
        return response.data;
    },
    
    getProductsByCategory: async (category: string): Promise<Product[]> => {
        const response = await axios.get(`${API_URL}/category/${category}`);
        return response.data;
    },
    
    getProductsByStatus: async (status: string): Promise<Product[]> => {
        const response = await axios.get(`${API_URL}/status/${status}`);
        return response.data;
    },


    getProductCategoryCounts: async (): Promise<{ category: string; value: number }[]> => {
        try {
            const products = await ProductService.getAllProducts();
            
            const categoryCounts: Record<string, number> = {};
            
            products.forEach(product => {
                if (product.category) {
                    categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
                }
            });
            

            return Object.entries(categoryCounts)
                .map(([category, value]) => ({
                    category,
                    value
                }))
                .sort((a, b) => b.value - a.value); 
        } catch (error) {
            console.error('Error fetching products by category:', error);
            return [];
        }
    },

    getProductPerformanceData: async (): Promise<ProductPerformance[]> => {
        try {

            const [products, invoices] = await Promise.all([
                ProductService.getAllProducts(),
                InvoiceService.getAllInvoices()
            ]);
            
            const productPerformanceMap = new Map<number, ProductPerformance>();

            products.forEach(product => {
                if (product.id) {
                    productPerformanceMap.set(product.id, {
                        id: product.id,
                        name: product.name,
                        salesVolume: 0,
                        profitMargin: 0,
                        revenue: 0,
                        category: product.category
                    });
                }
            });

            invoices.forEach(invoice => {
                invoice.items.forEach(item => {
                    if (item.product && item.product.id) {
                        const productId = item.product.id;
                        const performance = productPerformanceMap.get(productId);
                        
                        if (performance) {
                            const itemRevenue = item.quantity * item.product.price * (1 - (item.discount || 0) / 100);
                            
                            const estimatedCost = item.product.price * 0.6;
                            const profit = item.product.price - estimatedCost;
                            const profitMargin = (profit / item.product.price) * 100;
                            
                            performance.salesVolume += item.quantity;
                            performance.revenue += itemRevenue;
                            performance.profitMargin = profitMargin; 
                        }
                    }
                });
            });
            
            return Array.from(productPerformanceMap.values());
            
        } catch (error) {
            console.error('Error fetching product performance data:', error);
            return [];
        }
    }
};

export default ProductService;