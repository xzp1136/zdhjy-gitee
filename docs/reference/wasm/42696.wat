  (func (;42696;) (type 1) (param i32 i32)
    i32.const 4366159
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3357576
      call 2180
      i32.const 4366159
      i32.const 1
      i32.store8
    end
    i32.const 3357576
    i32.load
    local.tee 0
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 0
      call 60460
    end
    i32.const 4367470
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3357576
      call 2180
      i32.const 4367470
      i32.const 1
      i32.store8
    end
    i32.const 3357576
    i32.load
    local.tee 0
    i32.load offset=116
    if (result i32)  ;; label = @1
      local.get 0
    else
      local.get 0
      call 60460
      i32.const 3357576
      i32.load
    end
    i32.load offset=92
    i32.load
    local.tee 0
    if  ;; label = @1
      local.get 0
      i32.const 0
      call 41031
    end
    i32.const 0
    call 56067
    local.tee 0
    local.get 0
    i32.load offset=400
    i32.const 1
    i32.add
    i32.store offset=400)
