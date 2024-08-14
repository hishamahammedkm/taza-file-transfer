import { supabase } from '~/utils/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useInsertInvoice = () => {
  // const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: any) {
      const { error, data: newProduct } = await supabase
        .from('invoices')
        .insert({
          invoice_number: data.invoice_number,
          branch_code: data.branch_code,
          remarks: data.remarks,
          file_path: data.file_path,
          date_time: data.date_time,
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
