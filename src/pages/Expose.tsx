
  // Update selected products
  const handleProductSelect = async (products: any[]) => {
    if (!exposeId) return;
    
    try {
      const productIds = products.map(product => product.id);
      
      const { error } = await supabase
        .from('exposes')
        .update({ selected_product_ids: productIds })
        .eq('id', exposeId);
      
      if (error) throw error;
      
      setSelectedProducts(products);
      queryClient.invalidateQueries({ queryKey: ['expose', exposeId] });
      
      toast({
        title: "Success",
        description: "Products updated successfully!"
      });
    } catch (error) {
      console.error('Error updating products:', error);
      toast({
        title: "Error",
        description: "Failed to update products.",
        variant: "destructive"
      });
    }
  };
