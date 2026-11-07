  (func (;43499;) (type 1) (param i32 i32)
    local.get 0
    i32.load offset=8
    i32.const 0
    i32.store offset=124
    local.get 0
    i32.load offset=12
    local.tee 0
    if  ;; label = @1
      local.get 0
      i32.load offset=32
      local.get 0
      i32.load offset=20
      local.get 0
      i32.load offset=12
      call_indirect (type 1)
    end)
