  (func (;43413;) (type 1) (param i32 i32)
    local.get 0
    i32.const 0
    i32.store8 offset=129
    i32.const 4367476
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3361216
      call 2180
      i32.const 4367476
      i32.const 1
      i32.store8
    end
    i32.const 3361216
    i32.load
    i32.load offset=92
    i32.load
    local.tee 0
    if  ;; label = @1
      local.get 0
      local.get 0
      call 43412
    end)
