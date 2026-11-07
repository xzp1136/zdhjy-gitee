  (func (;43463;) (type 1) (param i32 i32)
    (local i32)
    i32.const 4366765
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3354340
      call 2180
      i32.const 3413764
      call 2180
      i32.const 4366765
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load8_u offset=120
    i32.eqz
    if  ;; label = @1
      local.get 0
      i32.const 1
      i32.store8 offset=129
      local.get 0
      i32.const 1
      i32.store8 offset=120
      local.get 0
      i32.const 1
      i32.store8 offset=76
      local.get 0
      i32.load offset=92
      local.set 1
      local.get 0
      local.get 0
      call 43464
      i32.const 3354340
      i32.load
      call 1900
      local.tee 2
      local.get 0
      i32.const 3413764
      i32.load
      i32.const 0
      call 38015
      local.get 0
      local.get 1
      local.get 2
      local.get 0
      call 43465
    end)
