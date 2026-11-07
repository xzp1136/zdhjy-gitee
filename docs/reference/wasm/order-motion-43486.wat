  (func (;43486;) (type 1) (param i32 i32)
    i32.const 4367477
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360984
      call 2180
      i32.const 4367477
      i32.const 1
      i32.store8
    end
    i32.const 3360984
    i32.load
    i32.load offset=92
    i32.load
    local.tee 1
    if  ;; label = @1
      local.get 1
      local.get 0
      i32.load offset=96
      local.get 0
      call 43411
    end)
