import axios from 'axios';

const API_URL = 'http://localhost:8080/api/categories';

export interface Category {
    id?: number;
    name: string;
    description: string;
    createdAt?: string;
    updatedAt?: string;
}

const CategoryService = {
    getAllCategories: async (): Promise<Category[]> => {
        const response = await axios.get(API_URL);
        return response.data;
    },
    
    getCategoryById: async (id: number): Promise<Category> => {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    },
    
    createCategory: async (category: Category): Promise<Category> => {
        const response = await axios.post(API_URL, category);
        return response.data;
    },
    
    updateCategory: async (id: number, category: Category): Promise<Category> => {
        const response = await axios.put(`${API_URL}/${id}`, category);
        return response.data;
    },
    
    deleteCategory: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/${id}`);
    },
    
    searchCategories: async (name: string): Promise<Category[]> => {
        const response = await axios.get(`${API_URL}/search?name=${name}`);
        return response.data;
    }
};

export default CategoryService;