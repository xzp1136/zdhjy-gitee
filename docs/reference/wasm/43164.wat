  (func (;43164;) (type 1) (param i32 i32)
    i32.const 4366530
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3357576
      call 2180
      i32.const 4366530
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
    block  ;; label = @1
      i32.const 3357576
      i32.load
      local.tee 0
      i32.load offset=116
      if  ;; label = @2
        local.get 0
        i32.load offset=92
        i32.load
        i32.const 1
        i32.store offset=16
        br 1 (;@1;)
      end
      local.get 0
      call 60460
      i32.const 4367470
      i32.load8_u
      local.set 1
      i32.const 3357576
      i32.load
      local.tee 0
      i32.load offset=92
      i32.load
      i32.const 1
      i32.store offset=16
      local.get 1
      br_if 0 (;@1;)
      i32.const 3357576
      call 2180
      i32.const 4367470
      i32.const 1
      i32.store8
      i32.const 3357576
      i32.load
      local.set 0
    end
    local.get 0
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
      call 41059
    end)
