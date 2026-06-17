-- Keep expense sync resilient for clients that omit the default category.
CREATE OR REPLACE FUNCTION public.normalize_expense_category()
RETURNS trigger AS $$
BEGIN
    NEW.category := COALESCE(NULLIF(NEW.category, ''), 'OTHER');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS normalize_expense_category_trigger
ON public.expense_entries;

CREATE TRIGGER normalize_expense_category_trigger
BEFORE INSERT OR UPDATE ON public.expense_entries
FOR EACH ROW
EXECUTE FUNCTION public.normalize_expense_category();
