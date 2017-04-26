-- Tries to match two lists. If they match, the result consists of the sublist
-- bound to the wildcard in the pattern list.
match :: Eq a => a -> [a] -> [a] -> Maybe [a]
match _ [] [] = Just []
match _ [] _  = Nothing
match _ _ []  = Nothing
match wc (p:ps) (s:ss)
  | p == s    = match wc ps ss -- recursively check if the lists match
  | wc == p   = orElse (singleWildcardMatch (p:ps) (s:ss)) (longerWildcardMatch (p:ps) (s:ss)) 
  | otherwise = Nothing