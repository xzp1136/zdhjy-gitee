  (func (;43461;) (type 1) (param i32 i32)
    (local i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 1
    global.set 0
    i32.const 4366764
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3387256
      call 2180
      i32.const 3385828
      call 2180
      i32.const 3385832
      call 2180
      i32.const 4366764
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 0
      i32.load offset=92
      local.tee 2
      i32.const 0
      i32.lt_s
      br_if 0 (;@1;)
      local.get 2
      local.get 0
      i32.load offset=56
      local.tee 3
      i32.load offset=12
      i32.ge_s
      br_if 0 (;@1;)
      local.get 3
      local.get 2
      local.get 1
      i32.const 12
      i32.add
      i32.const 3385832
      i32.load
      call 50458
      local.get 1
      i32.load offset=12
      i32.load offset=12
      local.get 0
      i32.load offset=72
      i32.lt_s
      if  ;; label = @2
        local.get 0
        i32.const 0
        i32.store8 offset=76
        br 1 (;@1;)
      end
      local.get 0
      i32.const 1
      i32.store8 offset=76
      local.get 0
      local.get 0
      call 43463
    end
    local.get 1
    i32.const 16
    i32.add
    global.set 0)
