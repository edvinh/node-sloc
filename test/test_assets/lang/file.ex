%{a: "New Value"} = %{  %{ a: "Old Value" } | a: "New Value" }

# Note that this does not work to add a new key
%{ %{} | new_key: 1}
# Raises (KeyError) key :new_key not found in: %{}

# Map.put/3 will add a key if it does not exist
%{new_key: 1} = Map.put(%{}, :new_key, 1)
# or update the value if it does exist
%{new_key: 2} = Map.put(%{new_key: 1}, :new_key, 2)
