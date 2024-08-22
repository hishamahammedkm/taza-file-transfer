type MenuItem = {
  value: string;
  id?: string;
  label: string;
};

interface Invoice {
  invoice_number?: string;
  branch_id?: string;
  user_id?: string;

  remarks?: string;
  file_path?: string;
  date_time: Date;
}
