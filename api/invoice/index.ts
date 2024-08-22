import { supabase } from '~/utils/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '~/providers/AuthProvider';

export const useInsertInvoice = () => {
  const { session, loading } = useAuth();

  // const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: Invoice) {
      const { error, data: newProduct } = await supabase
        .from('invoices')
        .insert({
          invoice_number: data.invoice_number,
          branch_id: data.branch_id,
          remarks: data.remarks,
          file_path: data.file_path,
          date_time: data.date_time,
          user_id: session?.user.id,
        })
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return newProduct;
    },
    //   async onSuccess() {
    //     await queryClient.invalidateQueries(['products']);
    //   },
  });
};

export const useBranches = () => {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase.from('branches').select('*');
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};
