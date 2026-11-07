  (func (;43184;) (type 1) (param i32 i32)
    (local i32 i32)
    i32.const 4366545
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3399424
      call 2180
      i32.const 4366545
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=20
    local.tee 2
    if  ;; label = @1
      local.get 2
      i32.const 0
      i32.const 0
      local.get 2
      i32.load
      local.tee 1
      i32.load offset=236
      local.get 1
      i32.load offset=232
      call_indirect (type 6)
    end
    local.get 0
    i32.load offset=24
    local.tee 2
    if  ;; label = @1
      i32.const 3399424
      i32.load
      local.tee 3
      i32.load offset=28
      local.tee 1
      if (result i32)  ;; label = @2
        local.get 1
      else
        local.get 3
        call 1598
        drop
        local.get 3
        i32.load offset=28
      end
      i32.load offset=8
      local.tee 1
      i32.load8_u offset=189
      i32.const 1
      i32.and
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 1596
        local.set 1
      end
      local.get 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      local.get 2
      i32.const 0
      local.get 3
      i32.load offset=28
      i32.load offset=8
      local.tee 1
      i32.load8_u offset=189
      i32.const 1
      i32.and
      if (result i32)  ;; label = @2
        local.get 1
      else
        local.get 1
        call 1596
      end
      i32.load offset=92
      i32.load
      local.get 2
      i32.load
      local.tee 1
      i32.load offset=228
      local.get 1
      i32.load offset=224
      call_indirect (type 6)
    end
    local.get 0
    i32.load offset=28
    local.tee 0
    if  ;; label = @1
      local.get 0
      i32.const 0
      i32.const 0
      local.get 0
      i32.load
      local.tee 2
      i32.load offset=236
      local.get 2
      i32.load offset=232
      call_indirect (type 6)
    end)
