type MenuItem = {
  value: string;
  id?: string;
  label: string;
};

interface Invoice {
  invoice_number?: string;
  branch_code?: string;
  remarks?: string;
  file_path?: string;
  date_time: Date;
}
