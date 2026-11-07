  (func (;41010;) (type 145) (param i32 i32 f32 i32) (result f32)
    i32.const 4365112
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360788
      call 2180
      i32.const 4365112
      i32.const 1
      i32.store8
    end
    i32.const 3360788
    i32.load
    local.tee 0
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 0
      call 60460
    end
    block  ;; label = @1
      local.get 1
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 1
      i32.const 0
      call 21024
      local.set 0
      i32.const 3360788
      i32.load
      local.tee 3
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 3
        call 60460
      end
      local.get 0
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 1
      i32.const 0
      call 21024
      i32.const 0
      call 21200
      local.tee 1
      i32.eqz
      br_if 0 (;@1;)
      local.get 1
      i32.load offset=12
      i32.eqz
      br_if 0 (;@1;)
      local.get 1
      i32.load offset=16
      i32.const 0
      call 20778
      local.set 2
    end
    local.get 2)
