import { useCallback, useState } from "react";

const useForm = <T>(initialState: T) => {
  const [formState, setFormState] = useState(initialState);
  const [updatedField, setUpdatedField] = useState<null | string>(null);

  const updateField = useCallback((fieldName: string, value: any) => {
    setFormState((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));
    setUpdatedField(fieldName);
  }, []);

  return {
    formState,
    updateField,
    updatedField,
  };
};

export default useForm;
