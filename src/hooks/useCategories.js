// src/hooks/useCategories.js
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../api/supabase';

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('created_at', { ascending: false });

    if (error) setError(error.message);
    else setCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (category) => {
    const payload = {
      name: category.name,
      ...(category.created_by && { created_by: category.created_by }), // ✅ أضف created_by فقط إذا تم تمريره
    };

    const { data, error } = await supabase.from('categories').insert([payload]).select();
    if (error) throw error;

    await fetchCategories();
    return data?.[0];
  };

  const updateCategory = async (id, updates) => {
    const { error } = await supabase.from('categories').update(updates).eq('id', id);
    if (error) throw error;
    await fetchCategories();
  };

  const deleteCategory = async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    await fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
}
